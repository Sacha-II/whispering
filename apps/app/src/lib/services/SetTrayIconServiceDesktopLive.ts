import { recorder } from '$lib/stores/recorder.svelte';
import { WhisperingError, type RecorderState } from '@repo/shared';
import { Menu, MenuItem } from '@tauri-apps/api/menu';
import { TrayIcon } from '@tauri-apps/api/tray';
import { Effect, Layer } from 'effect';
import { SetTrayIconService } from './SetTrayIconService';
import { resolveResource } from '@tauri-apps/api/path';

async function getIconPath(recorderState: RecorderState) {
	const iconPaths = {
		IDLE: 'recorder-state-icons/studio_microphone.png',
		RECORDING: 'recorder-state-icons/red_large_square.png',
		LOADING: 'recorder-state-icons/arrows_counterclockwise.png',
	} as const;
	return await resolveResource(iconPaths[recorderState]);
}

export const SetTrayIconServiceDesktopLive = Layer.effect(
	SetTrayIconService,
	Effect.gen(function* () {
		const trayPromise = (async () => {
			const quitMenuItem = await MenuItem.new({
				text: 'Quit',
				action: (e) => console.log(e),
			});

			const trayMenu = await Menu.new({
				id: 'quit',
				items: [quitMenuItem],
			});

			const tray = await TrayIcon.new({
				id: 'tray',
				icon: await getIconPath('IDLE'),
				menu: trayMenu,
				tooltip: 'Your App Name',
				action: (e) => {
					if ('click' in e) {
						recorder.toggleRecording();
					}
				},
			});
			return tray;
		})();
		return {
			setTrayIcon: (recorderState) =>
				Effect.tryPromise({
					try: async () => {
						const iconPath = await getIconPath(recorderState);
						return (await trayPromise).setIcon(iconPath);
					},
					catch: (error) =>
						new WhisperingError({
							variant: 'warning',
							title: `Could not set tray icon to ${recorderState} icon...`,
							description: error instanceof Error ? error.message : `Error: ${error}`,
							error,
						}),
				}),
		};
	}),
);
