import React, { PropTypes, Component } from 'react'
import { fetchResources } from '../middleware/api'
import {
  LetObj,
  StringProp,
  QuotedProp,
  AutofetchRelatedResourcesProp
} from '../components/Indent'

export default class ResourceList extends Component {
  static propTypes = {
    resourceType: PropTypes.string.isRequired,
    page: PropTypes.number
  }
  constructor(props) {
    super(props);
    this.state = {
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
    this.onFilterChange = this.onFilterChange.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
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
    const { resourceType } = this.props;
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
      });
  }
  render() {
    const { resourceType } = this.props;
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