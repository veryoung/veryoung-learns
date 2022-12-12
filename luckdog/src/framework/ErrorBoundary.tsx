/* eslint-disable no-unused-vars */
import React from 'react';
import { View, Text } from '@tencent/hippy-react-qb';
import { logError } from '@/luckdog';

interface State {
  error: any;
}

/**
 * Error boundary component with error handler lifecycle
 * https://reactjs.org/docs/error-boundaries.html
 */
class ErrorBoundary extends React.Component<any, State> {
  public static getDerivedStateFromError(error) {
    return { error };
  }
  public constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  // eslint-disable-next-line class-methods-use-this, no-console
  public componentDidCatch(error, errorInfo) {
    console.error('[feeds]', error, errorInfo);
    logError(error, 'ErrorBoundary.componentDidCatch');
  }

  public render() {
    const { children } = this.props;
    // @ts-expect-error __PLATFORM__
    // return children directly if build for production.
    if (typeof __PLATFORM__ !== 'undefined') {
      return children;
    }
    const { error } = this.state;
    if (error) {
      return (
        <View collapsable={false}>
          <Text>{error.message || error}</Text>
        </View>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
