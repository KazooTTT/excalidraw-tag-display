import { Plugin } from "obsidian";

class Logger {
	private pluginName: string;

	constructor(pluginName: string) {
		this.pluginName = pluginName;
	}

	log(...args: any[]) {
		console.log(`[${this.pluginName}]`, ...args);
	}

	error(...args: any[]) {
		console.error(`[${this.pluginName}]`, ...args);
	}
}

export default class MyPlugin extends Plugin {
	private logger: Logger;

	constructor(app: any, manifest: any) {
		super(app, manifest);
		this.logger = new Logger("Excalidraw Tag Display");
	}

	addExcalidrawTags = () => {
		this.logger.log("Starting addExcalidrawTags");
		const fileExplorers =
			this.app.workspace.getLeavesOfType("file-explorer");
		this.logger.log("Found file explorers:", fileExplorers.length);

		fileExplorers.forEach((fileExplorer) => {
			this.logger.log("File explorer view:", fileExplorer.view);
			const fileItems = (fileExplorer.view as any).fileItems;
			this.logger.log("File items keys:", Object.keys(fileItems).length);

			for (const path in fileItems) {
				const fileItem = fileItems[path];
				if (path.endsWith(".excalidraw.md")) {
					this.logger.log("Found excalidraw file:", path);
					this.logger.log("Full fileItem:", fileItem);

					if (!fileItem || !fileItem.selfEl) {
						this.logger.error(
							"fileItem or fileItem.selfEl is missing for path:",
							path
						);
						continue;
					}

					// 检查是否已经添加了标签
					const existingTag =
						fileItem.selfEl.querySelector(".nav-file-tag");
					if (existingTag) {
						this.logger.log("Tag already exists for:", path);
						continue;
					}

					try {
						const tag = createDiv({
							cls: "nav-file-tag",
							text: "excalidraw",
						});

						// 获取正确的目标元素
						const selfEl = fileItem.selfEl;
						if (selfEl) {
							selfEl.appendChild(tag);
							this.logger.log("Successfully added tag to:", path);
						} else {
							this.logger.error(
								"Could not find tree-item-inner for:",
								path
							);
						}
					} catch (error) {
						this.logger.error("Error adding tag to", path, error);
					}
				}
			}
		});
	};

	async onload() {
		this.logger.log("Plugin loading");
		await this.loadSettings();
		this.logger.log("Settings loaded");

		// Wait for workspace to be ready
		this.app.workspace.onLayoutReady(() => {
			this.logger.log("Workspace layout is ready");
			this.addExcalidrawTags();

			// 监听文件资源管理器的变化
			this.registerEvent(
				this.app.workspace.on("file-menu", () => {
					this.logger.log("File menu event triggered");
					this.addExcalidrawTags();
				})
			);

			// 监听文件变化
			this.registerEvent(
				this.app.vault.on("create", () => {
					this.logger.log("File created event triggered");
					this.addExcalidrawTags();
				})
			);
		});
	}

	onunload() {
		this.logger.log("Plugin unloading");
	}

	async loadSettings() {
		this.logger.log("Loading settings");
	}

	async saveSettings() {
		this.logger.log("Saving settings");
	}
}
