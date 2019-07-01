/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// mock out a FileReader

var pngSrc =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACZJREFUeNrtwQEBAAAAgiD' +
  '/r25IQAEAAAAAAAAAAAAAAAAAAADvBkCAAAEehacTAAAAAElFTkSuQmCC';
var tinyPngSrc =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

function FileReaderMock() {
  // nothing to do
}

FileReaderMock._mockFileEvent = function(type, src) {
  var file = {
    _dataURL: src,
    type: type,
  };

  return {
    target: {
      files: [file],
    },
  };
};

FileReaderMock._mockPngEvent = function() {
  return this._mockFileEvent('image/png', pngSrc);
};

FileReaderMock._mockTinyPngEvent = function() {
  return this._mockFileEvent('image/png', tinyPngSrc);
};

FileReaderMock._mockBadPngEvent = function() {
  return this._mockFileEvent('image/png', 'data:image/png;base64,');
};

FileReaderMock._mockTextEvent = function() {
  return this._mockFileEvent('text/plain', 'hi');
};

FileReaderMock.prototype = {
  readAsDataURL(file) {
    this.onload({
      target: {
        result: file._dataURL,
      },
    });
  },
};

export default FileReaderMock;
