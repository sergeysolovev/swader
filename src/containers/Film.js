import React from 'react'
import { fetchResource, fetchRelatedResources } from '../middleware/api'
import { LetObj, StringProp, RelatedResourcesProp } from '../components/Indent'
import PropTypes from 'prop-types'
import unplug from 'react-unplug'
import toRoman from '../utils/toRoman'

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
      fetchResource('films', params.id),
      film => {
        film = Object.assign({}, film, {
          episode: toRoman(film.episode_id || 0),
          opening: (film.opening_crawl || '').replace(/(\r\n)+/g, ' ')
        });
        this.setState({film});
        wire(
          fetchRelatedResources(film),
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

    const exceptUnavailableOffline = (items) =>
      (items || []).filter(res => !res.notAvailableOffline);

    return (
      <div className='container'>
        <LetObj name='film'>
          <StringProp name="episode" value={film.episode} />
          <StringProp name="title" value={film.title} />
          <StringProp name="released_on" value={film.release_date} />
          <StringProp name="directed_by" value={film.director} />
          <StringProp name="produced_by" value={film.producer} />
          <StringProp name="opening" value={film.opening} />
          <RelatedResourcesProp name='characters'
            items={exceptUnavailableOffline(characters)} />
          <RelatedResourcesProp name='starships'
            items={exceptUnavailableOffline(starships)} />
          <RelatedResourcesProp name='planets'
            items={exceptUnavailableOffline(planets)} />
          <RelatedResourcesProp name='species'
            items={exceptUnavailableOffline(species)} />
          <RelatedResourcesProp name='vehicles'
            items={exceptUnavailableOffline(vehicles)} />
        </LetObj>
      </div>
    );
  }
}
