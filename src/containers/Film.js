import React from 'react'
import { fetchFilm, fetchFilmResources } from '../middleware/api'
import { LetObj, StringProp, RelatedResourcesProp } from '../components/Indent'
import PropTypes from 'prop-types'
import unplug from '../utils/unplug'

export default class Film extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }
  constructor()
  {
    super();
    this.socket = unplug.socket();
    this.state = {
      film: {},
      resources: {}
    }
  }
  componentDidMount() {
    const {params} = this.props.match;
    this.socket.plug(wire => wire(
      fetchFilm(params.id),
      film => {
        this.setState({film});
        wire(
          fetchFilmResources(film),
          resources => this.setState({resources}),
          reason => {}
        );
      },
      reason => {}
    ));
  }
  componentWillUnmount() {
    this.socket.unplug();
  }
  render() {
    const film = this.state.film;
    const {
      characters,
      starships,
      planets,
      species,
      vehicles } = this.state.resources;
    return (
      <div className='container'>
        <LetObj name='film'>
          <StringProp name="episode" value={film.episode} />
          <StringProp name="title" value={film.title} />
          <StringProp name="released_on" value={film.release_date} />
          <StringProp name="directed_by" value={film.director} />
          <StringProp name="produced_by" value={film.producer} />
          <StringProp name="opening" value={film.opening} />
          <RelatedResourcesProp name='characters' items={characters} />
          <RelatedResourcesProp name='starships' items={starships} />
          <RelatedResourcesProp name='planets' items={planets} />
          <RelatedResourcesProp name='species' items={species} />
          <RelatedResourcesProp name='vehicles' items={vehicles} />
        </LetObj>
      </div>
    );
  }
}