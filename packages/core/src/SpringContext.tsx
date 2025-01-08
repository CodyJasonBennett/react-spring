import * as React from 'react'
import { useContext, PropsWithChildren } from 'react'
import { useMemoOne } from '@react-spring/shared'

/**
 * This context affects all new and existing `SpringValue` objects
 * created with the hook API or the renderprops API.
 */
export interface SpringContext {
  /** Pause all new and existing animations. */
  pause?: boolean
  /** Force all new and existing animations to be immediate. */
  immediate?: boolean
}

export const SpringContext = makeRenderableContext<
  SpringContext,
  PropsWithChildren<SpringContext>
>(
  Context =>
    ({ children, ...props }) => {
      const inherited = useContext(Context)

      // Inherited values are dominant when truthy.
      const pause = props.pause || !!inherited.pause
      const immediate = props.immediate || !!inherited.immediate

      // Memoize the context to avoid unwanted renders.
      props = useMemoOne(() => ({ pause, immediate }), [pause, immediate])

      return <Context value={props}>{children}</Context>
    },
  {} as SpringContext
)

interface RenderableContext<T, P> extends React.ProviderExoticComponent<P> {
  Provider: RenderableContext<T, P>
  Consumer: React.Consumer<T>
  displayName?: string
}

/** Make the `target` compatible with `useContext` */
function makeRenderableContext<T, P>(
  target: (context: React.Context<T>) => React.FunctionComponent<P>,
  init: T
): RenderableContext<T, P> {
  let context = React.createContext(init)
  context = Object.assign(context, target(context))

  // https://github.com/facebook/react/pull/28226
  if ('_context' in context.Provider) {
    context.Provider._context = target
  } else {
    context.Provider = context
  }
  // @ts-expect-error
  context.Consumer._context = context

  return context as unknown as RenderableContext<T, P>
}
