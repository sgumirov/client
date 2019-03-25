// @flow
import * as Types from '../../../constants/types/chat2'
import * as Chat2Gen from '../../../actions/chat2-gen'
import * as Constants from '../../../constants/chat2'
import * as Styles from '../../../styles'
import {isMobile, namedConnect} from '../../../util/container'
import HiddenString from '../../../util/hidden-string'
import ThreadSearch from '.'

type OwnProps = {|
  conversationIDKey: Types.ConversationIDKey,
  style?: Styles.StylesCrossPlatform,
|}

let KeyHandler: any = c => c
if (!isMobile) {
  KeyHandler = require('../../../util/key-handler.desktop').default
}

const mapStateToProps = (state, {conversationIDKey}) => {
  const info = Constants.getThreadSearchInfo(state, conversationIDKey)
  return {
    _hits: info.hits,
    inProgress: info.inProgress,
  }
}

const mapDispatchToProps = (dispatch, {conversationIDKey}) => ({
  _loadSearchHit: messageID =>
    dispatch(Chat2Gen.createLoadMessagesFromSearchHit({conversationIDKey, messageID})),
  onCancel: () => dispatch(Chat2Gen.createToggleThreadSearch({conversationIDKey})),
  onHotkey: (cmd: string) => {
    switch (cmd) {
      case 'esc':
        dispatch(Chat2Gen.createToggleThreadSearch({conversationIDKey}))
    }
  },
  onSearch: query =>
    dispatch(Chat2Gen.createThreadSearch({conversationIDKey, query: new HiddenString(query)})),
  selfHide: () => dispatch(Chat2Gen.createToggleThreadSearch({conversationIDKey})),
})

const mergeProps = (stateProps, dispatchProps, {conversationIDKey, style}) => ({
  hits: stateProps._hits
    .map(h => ({
      author: h.author,
      summary: h.bodySummary.stringValue(),
      timestamp: h.timestamp,
    }))
    .toArray(),
  hotkeys: ['esc'],
  inProgress: stateProps.inProgress,
  loadSearchHit: index => {
    const message = stateProps._hits.get(index, Constants.makeMessageText())
    if (message.id > 0) {
      dispatchProps._loadSearchHit(message.id)
    }
  },
  onCancel: dispatchProps.onCancel,
  onHotkey: dispatchProps.onHotkey,
  onSearch: dispatchProps.onSearch,
  selfHide: dispatchProps.selfHide,
  style,
})

export default namedConnect<OwnProps, _, _, _, _>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  'ThreadSearch'
)(KeyHandler(ThreadSearch))
