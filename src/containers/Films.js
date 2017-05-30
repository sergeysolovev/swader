import React from 'react'
import { LetLinkArray } from '../components/Indent'
import { fetchFilms } from '../middleware/api'

export default class Films extends React.Component {
  constructor() {
    super();
    this.state = { }
  }
  componentWillMount() {
    fetchFilms().then(({films}) => this.setState({films}));
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