import React, { PropTypes, Component } from 'react'
import PeopleList from '../components/PeopleList'
import Api, {fetchPeople} from '../middleware/api'
import Url from 'url'
import _ from 'lodash'

const FILTER_SHOW_ALL = ''

export default class PeopleListContainer extends Component {
  static propTypes = {
    page: PropTypes.number
  }
  constructor(props) {
    super(props);
    this.state = {
      filter: FILTER_SHOW_ALL,
      people: [],
      nextPage: undefined,
      prevPage: undefined,
      page: this.props.page,
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
    fetchPeople(filter, page)
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
    let prevPage = this.state.prevPage;
    let nextPage = this.state.nextPage;
    let isPageChanging = this.state.isPageChanging;
    let onPrevClick = (!isPageChanging && prevPage) ?
      this.onPrevClick : null;
    let onNextClick = (!isPageChanging && nextPage) ?
      this.onNextClick : null;
    let onPersonClick = this.props.onPersonClick;
    let people = this.state.people;
    const {isLoading, isError} = this.state;
    return (
      <div>
        <input type='text' onChange={this.onFilterChange}
          value={this.state.filter} />
        <PeopleList people={this.state.people}
          page={this.state.page}
          onPrevClick={onPrevClick}
          onNextClick={onNextClick}
          onPersonClick={onPersonClick}
          isLoading={isLoading}
          isError={isError} />
      </div>
    );
  }
}
