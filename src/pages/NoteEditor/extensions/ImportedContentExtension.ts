import { Mark } from '@tiptap/core';

export interface ImportedContentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    importedContent: {
      /**
       * Set the imported content mark
       */
      setImportedContent: () => ReturnType;
      /**
       * Toggle the imported content mark
       */
      toggleImportedContent: () => ReturnType;
      /**
       * Unset the imported content mark
       */
      unsetImportedContent: () => ReturnType;
    };
  }
}

export const ImportedContentExtension = Mark.create<ImportedContentOptions>({
  name: 'importedContent',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  // Add priority to ensure proper mark ordering
  priority: 1000,

  parseHTML() {
    return [
      {
        tag: 'span.imported-content',
      },
      // Add support for parsing the ImportedContent tag format
      {
        tag: 'ImportedContent',
        getAttrs: () => ({}),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...this.options.HTMLAttributes,
        class: 'imported-content',
        ...HTMLAttributes,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setImportedContent:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleImportedContent:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetImportedContent:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  // Allow other marks to be applied within this mark
  inclusive: true,

  // Add key binding to handle Enter key
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive(this.name)) {
          editor
            .chain()
            .splitBlock()
            .unsetMark(this.name)
            .run();
          return true;
        }
        return false;
      },
    };
  },

  // Add global attributes
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          class: {
            default: null,
            parseHTML: (element) => element.getAttribute('class'),
            renderHTML: (attributes) => {
              if (!attributes.class) {
                return {};
              }
              return { class: attributes.class };
            },
          },
        },
      },
    ];
  },

  // Add storage for tracking imported content
  addStorage() {
    return {
      importedSections: new Set<string>(),
    };
  },
});