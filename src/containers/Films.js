import React from 'react'
import { LetLinkArray } from '../components/Indent'
import { fetchFilms } from '../middleware/api'
import unplug from '../utils/unplug'

export default class Films extends React.Component {
  state = {
    films: []
  };
  socket = unplug.socket();
  componentDidMount() {
    this.socket.plug(wire => fetchFilms()
      .then(wire(films => this.setState({films})))
      .catch(error => {})
    );
  }
  componentWillUnmount() {
    this.socket.unplug();
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