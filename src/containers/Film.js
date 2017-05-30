import { fetchFilm, fetchFilmResources } from '../middleware/api'
import React from 'react'
import { LetObj, StringProp, LinkArrayProp } from '../components/Indent'

export default class Film extends React.Component {
  constructor()
  {
    super();
    this.state = {
      film: {},
      resources: {}
    }
  }
  componentWillMount() {
    const {params} = this.props;
    fetchFilm(params.filmId)
      .then(film => {
        this.setState({film});
        fetchFilmResources(film).then(resources => {
          this.setState({resources});
        });
      });
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
          <LinkArrayProp name="characters" items={characters} display={x => x.name} link={x => '#'} />
          <LinkArrayProp name="starships" items={starships} display={x => x.name} link={x => '#'} />
          <LinkArrayProp name="planets" items={planets} display={x => x.name} link={x => '#'} />
          <LinkArrayProp name="species" items={species} display={x => x.name} link={x => '#'} />
          <LinkArrayProp name="vehicles" items={vehicles} display={x => x.name} link={x => '#'} />
        </LetObj>
      </div>
    );
  }
}