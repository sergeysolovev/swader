import React from 'react'
import { Link } from 'react-router'

export default class StarshipItem extends React.Component {
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
          <th>model</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <td>
            <Link to={linkLocation}>{item.name}</Link>
          </td>
          <td>{item.model}</td>
        </tr>
      )
    }
  }
}
