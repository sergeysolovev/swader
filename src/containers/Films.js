import React from 'react'
import { LetLinkArray } from '../components/Indent'
import { fetchResources, getResourceDisplayName } from '../middleware/api'
import unplug from '../utils/unplug'

export default class Films extends React.Component {
  state = {
    films: []
  };
  socket = unplug.socket();
  componentDidMount() {
    this.socket.plug(wire => wire(
      fetchResources('films'),
      fetched => this.setState({films: fetched.results}),
      error => {}
    ));
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
          display={film => getResourceDisplayName('films', film)}
          link={film => `films/${film.id}`}
        />
      </div>
    );
  }
}
