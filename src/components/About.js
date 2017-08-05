import React from 'react'
import { Link } from 'react-router-dom'
import { LetObj, StringProp, QuotedProp, ObjProp } from '../components/Indent'
import { API_ROOT, throttleInterval } from '../middleware/api'

const About = () => (
  <div className="container">
    <LetObj name="swader">
      <StringProp name="version" value="0.2.2" />
      <StringProp name="stands_for" value="(S)tar (W)ars (A)PI's (D)ata (E)xplore(R)" />
      <QuotedProp name="about">
        <a href="https://facebook.github.io/react/">react.js</a> app
        for exloring the data provided by <a href="http://swapi.co">swapi.co</a>
      </QuotedProp>
      <QuotedProp name="source_code">
        <a href="https://github.com/sergeysolovev/swader">
          https://github.com/sergeysolovev/swader
        </a>
      </QuotedProp>
      <QuotedProp name="api_endpoint">
        <a href={`${API_ROOT}`}>
          {`${API_ROOT}`}
        </a>
      </QuotedProp>
      <QuotedProp name="api_throttle_interval">
        {`${throttleInterval/1000.0}`}s
      </QuotedProp>
      <ObjProp name="contents">
        <QuotedProp name="films"><Link to='/films'>/films</Link></QuotedProp>
        <QuotedProp name="chars"><Link to='/people'>/people</Link></QuotedProp>
        <QuotedProp name="ships"><Link to='/starships'>/starships</Link></QuotedProp>
        <QuotedProp name="planets"><Link to='/planets'>/planets</Link></QuotedProp>
        <QuotedProp name="vehicles"><Link to='/vehicles'>/vehicles</Link></QuotedProp>
        <QuotedProp name="species"><Link to='/species'>/species</Link></QuotedProp>
      </ObjProp>
    </LetObj>
  </div>
);

export default About
