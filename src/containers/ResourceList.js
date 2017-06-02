import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { fetchResources } from '../middleware/api'
import {
  LetObj,
  StringProp,
  QuotedProp,
  AutofetchRelatedResourcesProp
} from '../components/Indent'

export default class ResourceList extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
    this.getInitialState = this.getInitialState.bind(this);
    this.state = this.getInitialState();
  }
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
  onFilterChange(event) {
    let { results } = this.state;
    const filter = event.target.value;
    results[filter] = results[filter] || {
      items: [],
      nextPage: undefined,
      hasMore: true
    };
    this.setState({filter});
  }
  fetchMore() {
    let { results } = this.state;
    const { resourceType } = this.props.match.params;
    const { filter } = this.state;
    const { nextPage, items } = results[filter];
    fetchResources(resourceType, filter, nextPage)
      .then(fetched => {
        results[filter] = {
          items: items.concat(fetched.items),
          count: fetched.count,
          nextPage: fetched.nextPage,
          hasMore: Boolean(fetched.nextPage)
        };
        this.setState(results);
      })
      .catch(error => console.error(error));
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      this.setState(this.getInitialState());
    }
  }
  render() {
    const { match } = this.props;
    const { resourceType } = match.params;
    const { filter, results } = this.state;
    const { items, count, hasMore } = results[filter];
    return (
      resourceType ?
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
        </div> :
        <div />
    );
  }
}