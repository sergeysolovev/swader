import React from 'react'
import { Table } from 'semantic-ui-react'
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
        <Table.Row>
          <Table.HeaderCell>name</Table.HeaderCell>
          <Table.HeaderCell>model</Table.HeaderCell>
        </Table.Row>
      );
    } else {
      return (
        <Table.Row>
          <Table.Cell>
            <Link to={linkLocation}>{item.name}</Link>
          </Table.Cell>
          <Table.Cell>{item.model}</Table.Cell>
        </Table.Row>
      )
    }
  }
}
