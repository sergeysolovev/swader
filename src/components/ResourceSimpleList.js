import React from 'react'
import { getResourcePath } from '../routes'

const ResourceSimpleList = ({resourceType, items, itemComponent, location}) => (
  <table>
    <thead>
      {React.createElement(itemComponent, {isHeader: true})}
    </thead>
    <tbody>
      {items.map(item =>
        React.createElement(itemComponent, {
          key: item.id,
          item: item,
          linkLocation: {
            pathname: getResourcePath(resourceType, item.id),
            state: location.state
          }
        })
      )}
    </tbody>
  </table>
);

export default ResourceSimpleList
