import React from 'react'
import { fetchResource, fetchRelatedResources, isRelatedResource } from '../middleware/api'
import { LetObj, StringProp, RelatedResourcesProp } from '../components/Indent'

class Resource extends React.Component {
  constructor() {
    super();
    this.fetch = this.fetch.bind(this);
    this.state = {
      item: {},
      resources: {}
    }
  }
  fetch({resourceType, id}) {
    const excludedProps = ['id', 'created', 'edited', 'url' ];
    fetchResource(resourceType, id)
      .then(item => {
        excludedProps.forEach(exProp => delete item[exProp]);
        this.setState({item});
        fetchRelatedResources(item)
          .then(resources => {
            this.setState({resources});
          });
      });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      this.setState({item: {}, resources: {}});
      this.fetch(nextProps.match.params);
    }
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