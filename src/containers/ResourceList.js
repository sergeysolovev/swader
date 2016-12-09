import React, { PropTypes, Component } from 'react'
import { Link } from 'react-router'
import Api, { fetchResources } from '../middleware/api'
import { getResourcePath } from '../routes'
import Url from 'url'
import _ from 'lodash'
import ResourceSimpleList from '../components/ResourceSimpleList'

const FILTER_SHOW_ALL = ''

export default class ResourceList extends Component {
  static propTypes = {
    resourceType: PropTypes.string.isRequired,
    page: PropTypes.number
  }
  constructor(props) {
    super(props);
    const {location} = this.props;
    this.state = {
      filter: FILTER_SHOW_ALL,
      items: [],
      nextPage: undefined,
      prevPage: undefined,
      page: location && location.state && location.state.page,
      isLoading: false,
      isError: false
    };
    this.onNextClick = this.onNextClick.bind(this);
    this.onPrevClick = this.onPrevClick.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.refreshDataDelayed = _.debounce(this.refreshData, 200);
  }
  refreshData(filter = this.state.filter, page = this.state.page, state = {}) {
    this.setState({isLoading: true});
    fetchResources(this.props.resourceType, filter, page)
      .then(data => {
        if (filter === this.state.filter) {
          this.setState(Object.assign({}, data, state, {isLoading: false}));
        }});
  }
  onNextClick() {
    let nextPage = this.state.nextPage;
    if (nextPage) {
      this.refreshData(FILTER_SHOW_ALL, nextPage);
    }
  }
  onPrevClick() {
    let prevPage = this.state.prevPage;
    if (prevPage) {
      this.refreshData(FILTER_SHOW_ALL, prevPage);
    }
  }
  onFilterChange(event) {
    const filter = event.target.value;
    this.refreshDataDelayed(filter);
    this.setState({filter});
  }
  componentWillMount() {
    this.refreshData();
  }
  render() {
    const {isLoading, isError, page,
      prevPage, nextPage, isPageChanging,
      items } = this.state;
    const location = this.props.location || {};
    location.state = Object.assign({}, location.state,
      {page: this.state.page});
    const onPrevClick = (!isLoading && prevPage) && this.onPrevClick;
    const onNextClick = (!isLoading && nextPage) && this.onNextClick;
    const { resourceType, itemComponent } = this.props;
    return (
      <div>
        <input type='text' onChange={this.onFilterChange}
          value={this.state.filter} />
        <div>
          <ResourceSimpleList resourceType={resourceType}
            itemComponent={itemComponent}
            items={items}
            location={location} />
          {onPrevClick ?
            <a href='#' onClick={onPrevClick}>prev page</a> :
            <span>prev page</span>
          }
          <span> | </span>
          {onNextClick ?
            <a href='#' onClick={onNextClick}>next page</a> :
            <span>next page</span>
          }
          <span> | page #{page}</span>
          <br />
          {isLoading ? <span>Is loading...</span> : ' '}
          {isError ? <span>error!</span> : ' '}
        </div>
      </div>
    );
  }
}
