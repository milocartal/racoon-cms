// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { SessionProvider } from "next-auth/react";

export function withSessionProvider<P>(
  WrappedComponent: React.ComponentType<P>,
): React.ComponentType<P> {
  const ComponentWithSession = (props: P): React.ReactNode => (
    <SessionProvider>
      <WrappedComponent {...props} />
    </SessionProvider>
  );

  ComponentWithSession.displayName = `WithSessionProvider(${WrappedComponent.displayName ?? (WrappedComponent.name || "Component")})`;

  return ComponentWithSession;
}
