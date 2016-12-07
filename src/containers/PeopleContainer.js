import React from 'react'
import PersonDetailsContainer from '../containers/PersonDetailsContainer.js'
import PeopleListContainer from '../containers/PeopleListContainer.js'

export default class PeopleContainer extends React.Component {
  constructor() {
    super();
    this.peoplePage = undefined;
    this.state = {
      personId: undefined,
      peoplePage: undefined
    };
    this.handlePersonClick = this.handlePersonClick.bind(this);
    this.handleGetBackToListClick = this.handleGetBackToListClick.bind(this);
    this.handleChangePageClick = this.handleChangePageClick.bind(this);
  }
  handlePersonClick(personId) {
    this.setState({personId});
  }
  handleChangePageClick(peoplePage) {
    // don't set state here to avoid rerender
    this.peoplePage = peoplePage;
  }
  handleGetBackToListClick() {
    this.setState({personId: undefined, peoplePage: this.peoplePage});
  }
  render() {
    let personId = this.state.personId;
    let peoplePage = this.state.peoplePage;
    if (personId) {
      return <PersonDetailsContainer personId={personId}
        onGetBackToListClick={this.handleGetBackToListClick} />
    } else {
      return <PeopleListContainer page={peoplePage}
        onPersonClick={personId => this.handlePersonClick(personId)}
        onChangePageClick={peoplePage => this.handleChangePageClick(peoplePage)} />
    }
  }
}
