// @flow
import React from 'react'
import { View } from 'react-native'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import {
  getStore,
  userAvatarImagePath,
  userAvatarImageName,
} from '../../../../__mocks__/static-data'

import UserAvatar, { UserAvatarComponent } from '../user-avatar'
import type { GenericObject } from '../../../common/type-common'
import { getUserAvatarSource } from '../../../store/store-utils'

describe('<ConnectedUserAvatar />', () => {
  const store = getStore()

  function getProps(extraProps = {}) {
    return {
      selectUserAvatar: jest.fn(),
      ...extraProps,
    }
  }

  function setup(extraProps?: GenericObject = {}) {
    const props = getProps(extraProps)
    const component = renderer.create(<UserAvatarComponent {...props} />)
    const instance = component.getInstance()

    return { props, component, instance }
  }

  it('should match snapshot when no user image is selected', () => {
    const { component } = setup()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot when user image is selected', () => {
    const component = renderer.create(
      <Provider store={store}>
        <UserAvatar />
      </Provider>
    )
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should call children function if children is passed', () => {
    const functionAsChild = jest.fn()
    const child = (avatarSource) => {
      functionAsChild(avatarSource)
      return <View />
    }
    const props = getProps({
      avatarName: getUserAvatarSource(userAvatarImageName),
    })
    renderer.create(<UserAvatarComponent {...props}>{child}</UserAvatarComponent>)
    expect(functionAsChild).toHaveBeenCalled()
    expect(functionAsChild).toHaveBeenCalledWith({
      uri: userAvatarImagePath,
    })
  })

  it('should raise select avatar action if user can change image', () => {
    const extraProps = {
      userCanChange: true,
    }
    const { instance, props } = setup(extraProps)
    instance.changeAvatar()
    expect(props.selectUserAvatar).toHaveBeenCalledWith()
  })

  it(`should not raise select avatar action if user can't change image`, () => {
    const extraProps = {
      userCanChange: false,
    }
    const { instance, props } = setup(extraProps)
    instance.changeAvatar()
    expect(props.selectUserAvatar).not.toHaveBeenCalled()
  })
})
