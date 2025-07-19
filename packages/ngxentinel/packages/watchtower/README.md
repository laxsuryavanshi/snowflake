# @turtleby/watchtower

## Installation

```sh
yarn add @turtleby/watchtower
# or
npm install @turtleby/watchtower
```

## API Overview

### ActivityMonitor

- `timeout$: Observable<void>` — Emits after the configured period of inactivity.
- `reset(): void` — Manually resets the activity timer.

### ActivityMonitorOptions

- `timeout?: number` — Timeout duration in milliseconds (default: 30 minutes)
- `debounce?: number` — Debounce duration in milliseconds (default: 200ms)
- `monitorEvents?: (keyof DocumentEventMap)[]` — DOM events to monitor (default: click, keypress, mousemove, scroll, touchmove)
- `initStrategy?: string | (() => Observable<unknown>)` — Initialization strategy (default: 'initializeWhenStable:30000')

## Contributing

Contributions and feature requests are welcome! Please open an issue or submit a pull request.

## License

MIT
