import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { fetchResources } from '../middleware/api'
import cancelable from '../utils/cancelable'
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
  cancelFetch = cancelable.default;
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
    let { results } = this.state;
    const filter = event.target.value;
    results[filter] = results[filter] || {
      items: [],
      nextPage: undefined,
      hasMore: true
    };
    this.setState({filter});
  }
  fetchMore = () => {
    let { results } = this.state;
    const { resourceType } = this.props.match.params;
    const { filter } = this.state;
    const { nextPage, items } = results[filter];
    this.cancelFetch = cancelable.make(
      fetchResources(resourceType, filter, nextPage),
      fetched => {
        results[filter] = {
          items: items.concat(fetched.items),
          count: fetched.count,
          nextPage: fetched.nextPage,
          hasMore: Boolean(fetched.nextPage)
        };
        this.setState(results);
      },
      error => {}
    );
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      this.setState(this.getInitialState());
    }
  }
  componentWillUnmount() {
    this.cancelFetch.do();
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