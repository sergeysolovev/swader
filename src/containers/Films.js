import React from 'react'
import { LetLinkArray } from '../components/Indent'
import { fetchFilms } from '../middleware/api'
import cancelable from '../utils/cancelable'

export default class Films extends React.Component {
  state = {
    films: []
  };
  cancelFetch = cancelable.default;
  componentDidMount() {
    this.cancelFetch = cancelable.make(
      fetchFilms(),
      films => this.setState({films}),
      error => {}
    );
  }
  componentWillUnmount() {
    this.cancelFetch.do();
  }
  render() {
    const films = this.state.films || [];
    return (
      <div className='container'>
        <LetLinkArray
          name="starWarsFilmSeries"
          items={films}
          display={x => x.displayName}
          link={x => x.path}
        />
      </div>
    );
  }
}