import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { fetchResources } from '../middleware/api'
import unplug from '../utils/unplug'
import {
  LetObj,
  StringProp,
  QuotedProp,
  AutofetchRelatedResourcesProp
} from '../components/Indent'

export default class ResourceList extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        resourceType: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }
  state = this.getInitialState();
  socket = unplug.socket();
  getInitialState() {
    return {
      filter: '',
      data: {
        '': {
          items: [],
          count: 0,
          nextPage: undefined,
          hasMore: true
        }
      }
    };
  }
  onFilterChange = (event) => {
    event.persist();
    const filter = event.target.value;
    this.setState(prevState => ({
      filter,
      data: prevState.data[filter] ?
        prevState.data :
        Object.assign({}, prevState.data, {
          [filter]: {
            items: [],
            nextPage: undefined,
            hasMore: true
          }
        })
    }));
  }
  fetchMore = () => {
    const { resourceType } = this.props.match.params;
    const { data, filter } = this.state;
    const { nextPage } = data[filter];
    this.socket.plug(wire => wire(
      fetchResources(resourceType, nextPage),
      fetched => {
        this.setState(prevState => ({
          data: Object.assign({}, prevState.data, {
            [filter]: {
              items: prevState.data[filter].items.concat(fetched.results),
              count: fetched.count,
              nextPage: fetched.nextPage,
              hasMore: Boolean(fetched.nextPage)
            }
          })
        }));
      },
      reason => {}
    ));
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      this.setState(this.getInitialState());
    }
  }
  componentWillUnmount() {
    this.socket.unplug();
  }
  render() {
    const { match } = this.props;
    const { resourceType } = match.params;
    const { filter, data } = this.state;
    const { items, count, hasMore } = data[filter];
    return (
      <div className='container'>
        <LetObj name={resourceType}>
          <QuotedProp name='query'>
            <input
              className='searchBox'
              value={filter}
              size={filter.length || 1}
              onChange={this.onFilterChange}
            />
          </QuotedProp>
          <StringProp name='count' value={count} />
          <AutofetchRelatedResourcesProp
            name='data'
            prop={resourceType}
            items={items}
            fetchMore={this.fetchMore}
            hasMore={hasMore}
          />
        </LetObj>
      </div>
    );
  }
}
