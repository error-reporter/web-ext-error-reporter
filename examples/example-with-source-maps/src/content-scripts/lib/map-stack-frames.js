import { SourceMapConsumer } from 'source-map';
import ErrorStackParser from 'error-stack-parser';

const { mandatory } = window.Weer.Utils;

SourceMapConsumer.initialize({
  'lib/mappings.wasm': './mappings.wasm',
});

const findSourceMapUrl = (source) => {
  // From https://github.com/stacktracejs/stacktrace-gps/blob/master/stacktrace-gps.js

  const sourceMappingUrlRegExp = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/mg;
  var lastSourceMappingUrl;
  var matchSourceMappingUrl;
  while (matchSourceMappingUrl = sourceMappingUrlRegExp.exec(source)) {
    lastSourceMappingUrl = matchSourceMappingUrl[1];
  }
  if (lastSourceMappingUrl) {
    return lastSourceMappingUrl;
  } else {
    throw new Error('sourceMappingURL not found');
  }
};

const sourceUrlToMap = (sourceUrl) =>
  fetch(sourceUrl)
    .then((res) => res.text())
    .then(
      (source) => {
        console.log('source to url...');
        const sourceMapUrl = findSourceMapUrl(source);
        console.log('map url:', sourceMapUrl);
        return fetch(sourceMapUrl)
          .then((res) => res.json())
          .then((json) => ({ map: json }));
      },
      (error) => console.log('ERR1', error) || ({ ifError: { type: 'network-error', error } }),
    )
    .catch((error) => console.log('ERR2', error) ({ ifError: { type: 'get-source-map-error', error } }));

export const mapStackFramesAsync = async (
  frames = mandatory(),
  {
    urlToConsumerCache = {},
  } = {},
) => {

  const promises = frames.map(async (frame) => {

    let consumer = urlToConsumerCache[frame.fileName];
    if (!consumer) {
      const res = await sourceUrlToMap(frame.fileName);
      if (res.ifError) {
        return { ...frame, mappingError: res.ifError };
      }
      // TODO: Add error catching below.
      consumer = await new SourceMapConsumer(res.map, frame.fileName);
      urlToConsumerCache[frame.fileName] = consumer;
    }
    const loc = consumer.originalPositionFor({
      line: frame.lineNumber,
      column: frame.columnNumber,
    });
    return { ...frame, mapped: loc };
  });
  return Promise.all(promises);
};

export const mapErrorAsync = (error) => {

  const frames = ErrorStackParser.parse(error);
  return mapStackFramesAsync(frames);
}
