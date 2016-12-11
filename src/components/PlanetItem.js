import React from 'react'
import { Link } from 'react-router'

export default class PlanetItem extends React.Component {
  static propTypes = {
    item: React.PropTypes.object,
    linkLocation: React.PropTypes.object,
    isHeader: React.PropTypes.bool
  }
  render() {
    const {item, linkLocation, isHeader} = this.props;
    if (isHeader) {
      return (
        <tr>
          <th>name</th>
          <th>population</th>
          <th>terrain</th>
          <th>diameter</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <td>
            <Link to={linkLocation}>{item.name}</Link>
          </td>
          <td>{item.population}</td>
          <td>{item.terrain}</td>
          <td>{item.diameter}</td>
        </tr>
      )
    }
  }
}
