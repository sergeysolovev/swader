import React from 'react'
import { Link } from 'react-router'
import { LetObj, StringProp, QuotedProp, ObjProp } from '../components/Indent'

const About = () => (
  <div className="container">
    <LetObj name="swader">
      <StringProp name="version" value="0.1.0" />
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
      <ObjProp name="contents">
        <QuotedProp name="films"><Link to='/films'>/films</Link></QuotedProp>
        <QuotedProp name="chars"><Link to='/people'>/people</Link></QuotedProp>
        <QuotedProp name="ships"><Link to='/starships'>/starships</Link></QuotedProp>
        <QuotedProp name="planets"><Link to='/planets'>/planets</Link></QuotedProp>
      </ObjProp>
    </LetObj>
  </div>
);

export default About
