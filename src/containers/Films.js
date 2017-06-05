import React from 'react'
import { LetLinkArray } from '../components/Indent'
import { fetchFilms } from '../middleware/api'
import makeCancelable from '../utils/makeCancelable'

export default class Films extends React.Component {
  constructor() {
    super();
    this.state = { }
  }
  componentDidMount() {
    this.cancelFetch = makeCancelable(
      fetchFilms(),
      ({films}) => { this.setState({films}) },
      error => console.error(error)
    );
  }
  componentWillUnmount() {
    this.cancelFetch();
  }
  render() {
    return (
      <div className='container'>
        <LetLinkArray
          name="starWarsFilmSeries"
          items={this.state.films}
          display={f => `${f.episode} – ${f.title} (${f.year})`}
          link={f => `/films/${f.id}`}
        />
      </div>
    );
  }
}