import React, { PropTypes, Component } from 'react'
import PeopleList from '../components/PeopleList'
import api from '../middleware/api'
import Url from 'url'
import _ from 'lodash'

export default class PeopleListContainer extends Component {
  static propTypes = {
    peopleUrl: PropTypes.string
  }
  static defaultProps = {
    peopleUrl: 'people/'
  }
  constructor(props) {
    super(props);
    this.state = {
      url: this.props.peopleUrl,
      filter: '',
      people: [],
      nextPageUrl: '',
      prevPageUrl: '',
      pageNumber: 1,
      isPageChanging: false,
    };
    this.onNextClick = this.onNextClick.bind(this);
    this.onPrevClick = this.onPrevClick.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.refreshDataDelayed = _.debounce(this.refreshData, 200);
  }
  getCurrentPageNumber(nextPageUrl, prevPageUrl) {
    const getPageNumberFromUrl = url =>
      Url.parse(url, true).query.page;
    if (nextPageUrl) {
      return getPageNumberFromUrl(nextPageUrl) - 1;
    } else if (prevPageUrl) {
      return getPageNumberFromUrl(nextPageUrl) + 1;
    } else {
      return 1;
    }
  }
  fetchPeopleData(url) {
    return api(url)
      .then(json => ({
         people: json.results,
         url: url,
         nextPageUrl: json.next,
         prevPageUrl: json.previous,
         pageNumber: this.getCurrentPageNumber(json.next, json.previous)
      }));
  }
  refreshData(url, state = {}) {
    this.fetchPeopleData(url)
      .then(data => {
        let urlParsed = Url.parse(url, true);
        let searchQuery = urlParsed.query.search || '';
        let filter = this.state.filter || '';
        if (searchQuery === filter) {
          this.setState(Object.assign({}, data, state));
        }
      });
  }
  onNextClick() {
    let nextPageUrl = this.state.nextPageUrl;
    if (nextPageUrl) {
      let onChangePageClick = this.props.onChangePageClick;
      if (onChangePageClick) {
        onChangePageClick(nextPageUrl);
      }
      this.setState({isPageChanging: true});
      this.refreshData(nextPageUrl, {isPageChanging: false});
    }
  }
  onPrevClick() {
    let prevPageUrl = this.state.prevPageUrl;
    if (prevPageUrl) {
      let onChangePageClick = this.props.onChangePageClick;
      if (onChangePageClick) {
        onChangePageClick(prevPageUrl);
      }
      this.setState({isPageChanging: true});
      this.refreshData(prevPageUrl, {isPageChanging: false});
    }
  }
  onFilterChange(event) {
    let filter = event.target.value;
    let searchUrl = filter ?
      this.props.peopleUrl + `?search=${encodeURI(filter)}` :
      this.props.peopleUrl;
    this.setState({filter});
    this.refreshDataDelayed(searchUrl);
  }
  componentWillMount() {
    this.refreshData(this.state.url);
  }
  render() {
    let prevPageUrl = this.state.prevPageUrl;
    let nextPageUrl = this.state.nextPageUrl;
    let isPageChanging = this.state.isPageChanging;
    let onPrevClick = (!isPageChanging && prevPageUrl) ?
      this.onPrevClick : null;
    let onNextClick = (!isPageChanging && nextPageUrl) ?
      this.onNextClick : null;
    let onPersonClick = this.props.onPersonClick;
    let people = this.state.people;
    return (
      <div>
        <input type='text' onChange={this.onFilterChange}
          value={this.state.filter} />
        <PeopleList people={this.state.people}
          pageNumber={this.state.pageNumber}
          onPrevClick={onPrevClick}
          onNextClick={onNextClick}
          onPersonClick={onPersonClick} />
      </div>
    );
  }
}
