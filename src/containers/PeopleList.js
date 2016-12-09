import React, { PropTypes, Component } from 'react'
import { Link } from 'react-router'
import Api, { fetchResources } from '../middleware/api'
import { getResourcePath } from '../routes'
import Url from 'url'
import _ from 'lodash'

const FILTER_SHOW_ALL = ''
const RESOURCE_TYPE = 'people'

export default class PeopleList extends Component {
  static propTypes = {
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
      isPageChanging: false,
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
    fetchResources(RESOURCE_TYPE, filter, page)
      .then(data => {
        if (filter === this.state.filter) {
          this.setState(Object.assign({}, data, state, {isLoading: false}));
        }});
  }
  onNextClick() {
    let nextPage = this.state.nextPage;
    if (nextPage) {
      let onChangePageClick = this.props.onChangePageClick;
      if (onChangePageClick) {
        onChangePageClick(nextPage);
      }
      this.setState({isPageChanging: true});
      this.refreshData(FILTER_SHOW_ALL, nextPage, {isPageChanging: false});
    }
  }
  onPrevClick() {
    let prevPage = this.state.prevPage;
    if (prevPage) {
      let onChangePageClick = this.props.onChangePageClick;
      if (onChangePageClick) {
        onChangePageClick(prevPage);
      }
      this.setState({isPageChanging: true});
      this.refreshData(FILTER_SHOW_ALL, prevPage, {isPageChanging: false});
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
    const onPrevClick = (!isPageChanging && prevPage) && this.onPrevClick;
    let onNextClick = (!isPageChanging && nextPage) && this.onNextClick;
    return (
      <div>
        <input type='text' onChange={this.onFilterChange}
          value={this.state.filter} />
        <div>
          <table>
            <thead>
              <tr>
                <th>name</th>
                <th>gender</th>
                <th>height (cm)</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item =>
                (
                  <tr key={item.id}>
                    <td>
                      <Link to={{
                        pathname: getResourcePath(RESOURCE_TYPE, item.id),
                        state: location.state
                      }}>{item.name}</Link>
                    </td>
                    <td>{item.gender}</td>
                    <td>{item.height}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
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
