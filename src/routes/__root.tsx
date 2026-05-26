function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-dvh flex-col bg-background md:flex-row">
        {/* Desktop sidebar — hidden on mobile */}
        <DesktopSidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header — mobile only (desktop has sidebar title) */}
          <div className="md:hidden">
            <AppHeader />
          </div>
          {/* Desktop header strip */}
          <div className="hidden h-14 items-center border-b border-border bg-background px-6 md:flex">
            <AppHeader desktopMode />
          </div>
