import React from 'react'
import { fetchFilms, loadFilmResources } from '../middleware/api'

export default class Films extends React.Component {
  constructor() {
    super();
    this.state = {
      films: [],
      activeFilm: null,
      isFilmsLoading: false,
      isActiveFilmLoading: false
    }
  }
  componentWillMount() {
    this.setState({isFilmsLoading: true});
    fetchFilms()
      .then(({films}) => this.setState({films, isFilmsLoading: false}));
  }
  onTitleClick = (film) => {
    this.setState((prevState, props) => {
      const prevActiveFilm = prevState.activeFilm;
      if (prevActiveFilm && prevActiveFilm.id === film.id) {
        return {activeFilm: null};
      } else {
        loadFilmResources(film)
          .then(activeFilm =>
            this.setState({activeFilm, isActiveFilmLoading: false}));
        return {activeFilm: film, isActiveFilmLoading: true};
      }
    });
  }
  render() {
    const { films, activeFilm, isFilmsLoading,
      isActiveFilmLoading } = this.state;
    if (isFilmsLoading) {
      return (
        <div className='container'>
          <h1>#Star Wars Film Series (Loading...)</h1>
        </div>
      );
    } else {
      return (
        <div>
          <div className='container'>
            <h1>#Star Wars Film Series</h1>
          </div>
          {films.map(film => (activeFilm && film.id === activeFilm.id) ?
              <FilmActive key={film.id}
                film={activeFilm}
                isLoading={isActiveFilmLoading}
                onTitleClick={() => {this.onTitleClick(film)}} /> :
              <Film key={film.id} film={film}
                onTitleClick={() => {this.onTitleClick(film)}} />
            )
          }
        </div>
      );
    }
  }
}

const Film = ({film, onTitleClick}) => (
  <section className='film'>
    <div className='container'>
      <a onClick={onTitleClick}>
        <span className='film-title'>
          ##Episode {film.episode} – {film.title} ({film.year})
        </span>
      </a>
      <p className='film-desc'>{film.shortOpening} <a onClick={onTitleClick}>{'<...>'}</a></p>
    </div>
  </section>
);

const LinkList = ({name, list}) => (
  <tr className='spaceUnder'>
    <td className='film-data-name'>{name}</td>
    <td>
      {list.map(item =>
        <span key={item.name}>
          <a href='#'>{item.name}</a>&nbsp;&nbsp;
        </span>)
      }
    </td>
  </tr>
)

const FilmProps = ({film}) => (
  <tr className='spaceUnder'>
    <td colSpan="2">
      <span className='film-prop'>
        <span className='film-prop-name'>Released</span>
        {film.release_date}
      </span>
      <span className='film-prop'>
        <span className='film-prop-name'> Directed by </span>
        {film.director}
      </span>
      <span className='film-prop'>
        <span className='film-prop-name'> Produced by </span>
        {film.producer}
      </span>
    </td>
  </tr>
);

const FilmActive = ({film, onTitleClick, isLoading}) => (
  <section className='film film-alt'>
    <div className='container'>
      <a onClick={onTitleClick}>
        <span className='film-title'>
          ##Episode {film.episode} – {film.title} ({film.year})
        </span>
      </a>
      <p className='film-desc'>{film.opening}</p>
      <hr />
      <table className='film-props'>
        <tbody>
          <FilmProps film={film} />
          <LinkList name='Characters' list={film.characters} />
          <LinkList name='Starships' list={film.starships} />
          <LinkList name='Planets' list={film.planets} />
          <LinkList name='Species' list={film.species} />
          <LinkList name='Vehicles' list={film.vehicles} />
        </tbody>
      </table>
    </div>
  </section>
);


