import React from 'react'
import { Link } from 'react-router'
import InfiniteScroll from 'react-infinite-scroller'

// BASIC COMPONENTS:
const Indent = ({children}) => (
  <span>{"\u00a0\u00a0"}{children}</span>
);

const HalfIndent = ({children}) => (
  <span>{"\u00a0"}{children}</span>
);

const Just = ({value}) => (
  <span>{value}</span>
);

const Ref = ({to, children}) => (
  <a href={to}>{children || to}</a>
);

const Separator = ({items, index, sep = ", "}) => (
  <span>
    {(index === items.length - 1) ? "": sep}
  </span>
);

// ARRAYS:
const LetArray = ({name, children}) => (
  <div>
    <span>let {name} = [</span>
    {children ? <table>{children}</table> : ""}
    <span>];</span>
  </div>
);

const LetLinkArray = ({name, items, display, link}) => {
  if (Array.isArray(items)) {
    return (
      <LetArray name={name}>
        {items.map((item, index) =>
          <QuotedItem key={index}>
            <Link to={link(item)}>{display(item)}</Link>
          </QuotedItem>
        )}
      </LetArray>
    );
  } else {
    return (<LetArray name={name} />);
  }
};

const QuotedItem = ({children}) => (
  <tbody>
    <tr>
      <td><Indent/></td>
      <td className="expand">"{children}",</td>
    </tr>
  </tbody>
);

// OBJECTS:

const LetObj = ({name, children}) => (
  <div>
    <span>let {name} = {'{'}</span>
    <table>
      {children}
    </table>
    <span>{'};'}</span>
  </div>
);

const StringProp = ({name, value}) => (
  <QuotedProp name={name}>
    <Just value={value} />
  </QuotedProp>
);

const QuotedProp = ({name, children}) => (
  <tbody>
    <tr>
      <td><Indent /></td>
      <td>{name}:</td>
      <td><HalfIndent />"</td>
      <td className="expand">{children}{'",'}</td>
    </tr>
  </tbody>
);

const AutofetchLinkArrayProp = ({name, items, display, link, fetchMore, hasMore}) => (
  <tbody>
    <tr>
      <td><Indent/></td>
      <td>{name}:</td>
      <td>
        <HalfIndent />[
      </td>
      <td>
        <InfiniteScroll
          element='table'
          loadMore={fetchMore}
          hasMore={hasMore}
          threshold={0}>
            <tbody>
              {items.length > 0 ?
                items.map((item, index) =>
                  <tr key={index}>
                    <td>
                      <Link to={link(item)}>{display(item)}</Link>
                      {(index === items.length - 1) ? "]," : ","}
                    </td>
                  </tr>
                ) : <tr><td>],</td></tr>
              }
            </tbody>
        </InfiniteScroll>
      </td>
    </tr>
  </tbody>
);

const Prop = ({name, children}) => (
  <tbody>
    <tr>
      <td><Indent /></td>
      <td className="nowrap">{name}:</td>
      <td>
        <HalfIndent />
      </td>
      <td className="expand">{children}{','}</td>
    </tr>
  </tbody>
);

const ObjProp = ({name, children}) => {
  if (Array.isArray(children)) {
    return (
      <tbody>
        <tr>
          <td><Indent/></td>
          <td>{name}:</td>
          <td>
            <HalfIndent>{'{'}</HalfIndent>
          </td>
          <td></td>
        </tr>
        <tr>
          <td><Indent/></td>
          <td colSpan={3}>
            <table>{children}</table>
          </td>
        </tr>
        <tr>
          <td colSpan={4}>
            <Indent>{'},'}</Indent>
          </td>
        </tr>
      </tbody>
    );
  } else {
    return (
      <tbody>
        <tr>
          <td><Indent/></td>
          <td>{name}:</td>
          <td>
            <HalfIndent>{'{'}</HalfIndent>
          </td>
          <td>{children}{'},'}</td>
        </tr>
      </tbody>
    );
  }
}

const LinkArrayProp = ({name, items, display, link}) => {
  if (Array.isArray(items)) {
    return (
      <tbody>
        <tr>
          <td><Indent/></td>
          <td>{name}:</td>
          <td><HalfIndent />[</td>
          <td>
            {items
              .map((item, index) =>
                <span key={index}>
                  <Link to={link(item)}>{display(item)}</Link>
                  <Separator items={items} index={index} />
                </span>
              )
            }
            {'],'}
          </td>
        </tr>
      </tbody>
    );
  } else {
    return (
      <tbody>
        <tr>
          <td><Indent/></td>
          <td>{name}:</td>
          <td><HalfIndent />[</td>
          <td>{items}{'],'}</td>
        </tr>
      </tbody>
    );
  }
}

module.exports = {
  Indent,
  Ref,
  LetObj,
  ObjProp,
  Prop,
  QuotedProp,
  StringProp,
  LinkArrayProp,
  LetArray,
  QuotedItem,
  LetLinkArray,
  AutofetchLinkArrayProp,
}