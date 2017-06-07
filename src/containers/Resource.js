import React from 'react'
import { fetchResource, fetchRelatedResources, isRelatedResource } from '../middleware/api'
import { LetObj, StringProp, RelatedResourcesProp } from '../components/Indent'
import PropTypes from 'prop-types'
import cancelable from '../utils/cancelable'

class Resource extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        resourceType: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }
  constructor() {
    super();
    this.fetch = this.fetch.bind(this);
    this.cancelFetch = cancelable.default;
    this.state = {
      item: {},
      resources: {}
    }
  }
  fetch({resourceType, id}) {
    const excludedProps = ['id', 'created', 'edited', 'url' ];
    this.cancelFetch = cancelable.make(
      fetchResource(resourceType, id),
      item => {
        excludedProps.forEach(exProp => delete item[exProp]);
        this.setState({item});
        this.cancelFetch.with(
          fetchRelatedResources(item),
          resources => this.setState({resources}),
          err => console.error(err)
        )
      },
      err => console.error(err)
    );
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      this.setState({item: {}, resources: {}});
      this.fetch(nextProps.match.params);
    }
  }
  componentWillUnmount() {
    this.cancelFetch.do();
  }
  componentDidMount() {
    this.fetch(this.props.match.params);
  }
  render() {
    const { resourceType } = this.props.match.params;
    const { item, resources } = this.state;
    return (
      <div className='container'>
        <LetObj name={`${resourceType}Item`}>{
          Object
            .keys(item)
            .map(prop =>
              isRelatedResource(item[prop]) ?
                resources[prop] ?
                  <RelatedResourcesProp key={prop} name={prop} items={resources[prop]} /> :
                  <RelatedResourcesProp key={prop} name={prop} /> :
                <StringProp key={prop} name={prop} value={item[prop]} />)
        }</LetObj>
      </div>
    );
  }
}

export default Resource