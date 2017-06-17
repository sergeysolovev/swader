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
      results: {
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
      results: prevState.results[filter] ?
        prevState.results :
        Object.assign({}, prevState.results, {
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
    const { results, filter } = this.state;
    const { nextPage } = results[filter];
    this.socket.plug(wire => wire(
      fetchResources(resourceType, filter, nextPage),
      fetched => {
        this.setState(prevState => ({
          results: Object.assign({}, prevState.results, {
            [filter]: {
              items: prevState.results[filter].items.concat(fetched.items),
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
    const { filter, results } = this.state;
    const { items, count, hasMore } = results[filter];
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
            name='results'
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