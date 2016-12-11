import React from 'react'
import { getResourcePath } from '../routes'

const ResourceSimpleList = ({resourceType,
  items, itemComponent, location, onPrevClick, onNextClick, page,
  isLoading, isError}) => (
  <div>
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
    <div className='pager'>
      {onPrevClick ?
        <a href='#' onClick={onPrevClick}>prev</a> :
        <span>prev</span>
      }
      <span> | </span>
      {onNextClick ?
        <a href='#' onClick={onNextClick}>next</a> :
        <span>next</span>
      }
      <span> | page #{page}</span>
      {isLoading ? <span> | Is loading...</span> : ' '}
      {isError ? <span> | Error!</span> : ' '}
    </div>
  </div>
);

export default ResourceSimpleList
