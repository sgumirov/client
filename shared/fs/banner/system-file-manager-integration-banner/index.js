// @flow
import * as React from 'react'
import * as Types from '../../../constants/types/fs'
import * as Kb from '../../../common-adapters'
import {fileUIName} from '../../../constants/platform'
import * as Flow from '../../../util/flow'
import * as Styles from '../../../styles'

/*
 * This banner is used as part of a list in folder view and it's important to
 * have accurate height measured. If you change layout that results in height
 * change, please remember to update height accordingly.
 *
 */
export const height = 176

type Props = {|
  alwaysShow?: ?boolean,
  driverStatus: Types.DriverStatus,
  onDismiss: () => void,
  onEnable: () => void,
  onDisable: () => void,
|}

type BannerProps = {
  backgroundColor: string,
  okIcon: boolean,
  onDismiss?: ?() => void,
  title: string,
  body?: ?string,
  button?: ?{
    action: () => void,
    buttonText: string,
    inProgress: boolean,
  },
}

const Banner = (props: BannerProps) => (
  <Kb.Box2
    direction="horizontal"
    fullWidth={true}
    centerChildren={true}
    style={Styles.collapseStyles([styles.container, {backgroundColor: props.backgroundColor}])}
  >
    <Kb.Icon
      type={props.okIcon ? 'icon-fancy-finder-enabled-132-96' : 'icon-fancy-finder-132-96'}
      style={styles.fancyIcon}
    />
    <Kb.Box2
      direction="vertical"
      gap="small"
      fullHeight={true}
      style={styles.bodyContainer}
      centerChildren={true}
    >
      <Kb.Box2 direction="vertical" fullWidth={true} gap="xtiny">
        <Kb.Text type="Header" style={styles.text}>
          {props.title}
        </Kb.Text>
        {props.body && (
          <Kb.Box style={Styles.globalStyles.flexGrow}>
            <Kb.Text type="Body" style={styles.text}>
              {props.body}
            </Kb.Text>
          </Kb.Box>
        )}
      </Kb.Box2>
      {props.button && (
        <Kb.Box2 direction="horizontal" fullWidth={true}>
          <Kb.Button
            type="PrimaryGreen"
            label={props.button.buttonText}
            onClick={props.button.action}
            waiting={props.button.inProgress}
          />
        </Kb.Box2>
      )}
    </Kb.Box2>
    <Kb.Box style={Styles.globalStyles.flexGrow} />
    {!!props.onDismiss && (
      <Kb.Box2 direction="vertical" fullHeight={true}>
        <Kb.Icon
          type="iconfont-close"
          onClick={props.onDismiss}
          color={Styles.globalColors.white_40}
          fontSize={16}
          style={styles.dismissIcon}
        />
      </Kb.Box2>
    )}
  </Kb.Box2>
)

const ThisShouldNotHappen = () => (
  <Banner backgroundColor={Styles.globalColors.black} okIcon={false} title="This should not happen." />
)

const Enabled = (props: Props) => {
  if (props.driverStatus.type !== 'enabled') {
    return <ThisShouldNotHappen />
  }
  if (props.driverStatus.dokanOutdated) {
    return (
      <Banner
        backgroundColor={Styles.globalColors.blue}
        okIcon={false}
        title="Dokan is outdated."
        body={
          props.driverStatus.dokanOutdated === 'can-disable'
            ? 'A newer version of Dokan is available. It is reccomended that the current version be uninstalled before installing this update.'
            : 'A newer version of Dokan is available. Please remove the old version before installing it.'
        }
        button={
          props.driverStatus.dokanOutdated === 'can-disable'
            ? {
                action: props.onDisable,
                buttonText: 'Yes, uninstall',
                inProgress: props.driverStatus.isDisabling,
              }
            : null
        }
      />
    )
  }
  if (props.driverStatus.isDisabling) {
    // We already covered the dokan-uninstall disable case above, so this'd be
    // the rare case where user disables finder integration, and goes to Files
    // tab before it's done. Just show a simple banner in this case.
    return (
      <Banner
        backgroundColor={Styles.globalColors.blue}
        okIcon={false}
        title={`Disabling Keybase in ${fileUIName} ...`}
      />
    )
  }
  return (
    <Banner
      backgroundColor={Styles.globalColors.green}
      okIcon={true}
      title={`Keybase is enabled in your ${fileUIName}.`}
      onDismiss={props.alwaysShow ? null : props.onDismiss}
    />
  )
}

export default (props: Props) => {
  switch (props.driverStatus.type) {
    case 'disabled':
      return (
        <Banner
          backgroundColor={Styles.globalColors.blue}
          okIcon={false}
          title={`Enable Keybase in ${fileUIName}?`}
          body="Get access to your files and folders just like you normally do with your local files. It's encrypted and secure."
          button={{
            action: props.onEnable,
            buttonText: 'Yes, enable',
            inProgress: props.driverStatus.isEnabling,
          }}
          onDismiss={props.alwaysShow ? null : props.onDismiss}
        />
      )
    case 'enabled':
      return <Enabled {...props} />
    case 'unknown':
      return props.alwaysShow ? (
        <Banner
          backgroundColor={Styles.globalColors.blue}
          okIcon={false}
          title={'Loading'}
          body={`Trying to find out if Keybase is enabled in ${fileUIName} ...`}
        />
      ) : (
        <ThisShouldNotHappen />
      )
    default:
      Flow.ifFlowComplainsAboutThisFunctionYouHaventHandledAllCasesInASwitch(props.driverStatus.type)
      return <ThisShouldNotHappen />
  }
}

const styles = Styles.styleSheetCreate({
  bodyContainer: {
    maxWidth: Styles.globalMargins.large * 10 + Styles.globalMargins.mediumLarge * 2,
    padding: Styles.globalMargins.mediumLarge,
  },
  container: {
    height,
    maxHeight: height,
    minHeight: height,
  },
  dismissIcon: Styles.platformStyles({
    isElectron: {
      display: 'block',
      padding: Styles.globalMargins.tiny,
    },
  }),
  fancyIcon: {
    paddingLeft: Styles.globalMargins.large + Styles.globalMargins.tiny,
    paddingRight: Styles.globalMargins.small,
  },
  text: {
    color: Styles.globalColors.white,
  },
})