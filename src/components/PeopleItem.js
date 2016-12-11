import React from 'react'
import { Link } from 'react-router'
import { Table } from 'semantic-ui-react'

export const columns = 3;

export default class PeopleItem extends React.Component {
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
          <Table.HeaderCell>gender</Table.HeaderCell>
          <Table.HeaderCell>height (cm)</Table.HeaderCell>
        </Table.Row>
      );
    } else {
      return (
        <Table.Row>
          <Table.Cell>
            <Link to={linkLocation}>{item.name}</Link>
          </Table.Cell>
          <Table.Cell>{item.gender}</Table.Cell>
          <Table.Cell>{item.height}</Table.Cell>
        </Table.Row>
      )
    }
  }
}
