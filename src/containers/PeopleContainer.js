import React from 'react'
import PersonDetailsContainer from '../containers/PersonDetailsContainer.js'
import PeopleListContainer from '../containers/PeopleListContainer.js'

export default class PeopleContainer extends React.Component {
  constructor() {
    super();
    this.peopleUrl = 'people/';
    this.state = {
      personUrl: null,
      peopleUrl: this.peopleUrl
    };
    this.handlePersonClick = this.handlePersonClick.bind(this);
    this.handleGetBackToListClick = this.handleGetBackToListClick.bind(this);
    this.handleChangePageClick = this.handleChangePageClick.bind(this);
  }
  handlePersonClick(personUrl) {
    this.setState({personUrl});
  }
  handleChangePageClick(peopleUrl) {
    // don't set state here to avoid rerender
    this.peopleUrl = peopleUrl;
  }
  handleGetBackToListClick() {
    this.setState({personUrl: null, peopleUrl: this.peopleUrl});
  }
  render() {
    let personUrl = this.state.personUrl;
    let peopleUrl = this.state.peopleUrl;
    if (personUrl) {
      return <PersonDetailsContainer personUrl={personUrl}
        onGetBackToListClick={this.handleGetBackToListClick} />
    } else if (peopleUrl) {
      return <PeopleListContainer peopleUrl={peopleUrl}
        onPersonClick={personUrl => this.handlePersonClick(personUrl)}
        onChangePageClick={peopleUrl => this.handleChangePageClick(peopleUrl)} />
    }
  }
}
