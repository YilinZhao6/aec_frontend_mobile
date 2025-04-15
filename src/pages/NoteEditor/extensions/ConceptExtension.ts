import { Mark } from '@tiptap/core'

export const ConceptExtension = Mark.create({
  name: 'concept',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      tag: {
        default: null,
        parseHTML: element => element.getAttribute('data-concept-tag'),
        renderHTML: attributes => {
          if (!attributes.tag) {
            return {}
          }

          return {
            'data-concept-tag': attributes.tag,
          }
        },
      },
      mode: {
        default: 'fast',
        parseHTML: element => element.getAttribute('data-concept-mode'),
        renderHTML: attributes => {
          if (!attributes.mode) {
            return {}
          }

          return {
            'data-concept-mode': attributes.mode,
          }
        },
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-concept-tag]',
      },
      {
        tag: 'Concept',
        getAttrs: node => {
          const tag = node.firstElementChild?.tagName;
          return tag ? { tag } : null;
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 
      ...this.options.HTMLAttributes, 
      ...HTMLAttributes, 
      class: 'concept-mark'
    }, 0]
  },

  addCommands() {
    return {
      setConcept: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      unsetConcept: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
      toggleConcept: attributes => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
    }
  },
})