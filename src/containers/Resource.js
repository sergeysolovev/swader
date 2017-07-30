import React from 'react'
import { fetchResource, fetchRelatedResources, isRelatedResource } from '../middleware/api'
import { LetObj, StringProp, RelatedResourcesProp } from '../components/Indent'
import PropTypes from 'prop-types'
import unplug from '../utils/unplug'

class Resource extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        resourceType: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }
  state = {
    item: {},
    resources: {}
  }
  socket = unplug.socket();
  fetch = ({resourceType, id}) => {
    this.socket.plug(wire => wire(
      fetchResource(resourceType, id),
      item => {
        this.setState({item});
        wire(
          fetchRelatedResources(item),
          resources => this.setState({resources}),
          err => {}
        )
      },
      err => {}
    ));
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      this.setState({item: {}, resources: {}});
      this.fetch(nextProps.match.params);
    }
  }
  componentWillUnmount() {
    this.socket.unplug();
  }
  componentDidMount() {
    this.fetch(this.props.match.params);
  }
  render() {
    const excludedProps = ['id', 'created', 'edited', 'url' ];
    const { resourceType } = this.props.match.params;
    const { item, resources } = this.state;
    return (
      <div className='container'>
        <LetObj name={`${resourceType}Item`}>{
          Object
            .keys(item)
            .filter(prop => !excludedProps.includes(prop))
            .map(prop =>
              isRelatedResource(prop, item[prop]) ?
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
