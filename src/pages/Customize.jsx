import { useState } from 'react'
import EditScopeModal from '../components/dashboard/EditScopeModal.jsx'
import EditWidgetModal from '../components/widgets/EditWidgetModal.jsx'
import { renderRegistryWidget } from './Dashboard.jsx'
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from '../data/widgetRegistry.jsx'
import './Customize.css'

function GripIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  )
}

/* CustomizeBoard renders real WidgetCard instances using the shared
   registry, in edit mode. Drag-and-drop logic stays the same.

   Now controlled: the parent passes `layout` and `onLayoutChange` so
   the layout can be persisted on Save and discarded on Cancel. */
export function CustomizeBoard({ layout, onLayoutChange, onEditWidget, monitoring }) {
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)

  const startDrag = (source, id, index) => (e) => {
    setDrag({ source, id, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const endDrag = () => {
    setDrag(null)
    setOver(null)
  }

  const onCardDragOver = (column, index) => (e) => {
    if (!drag) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after'
    setOver({ column, index, position })
  }

  const onColumnDragOver = (column) => (e) => {
    if (!drag) return
    if (e.target.closest('.widget-card')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOver({ column, index: layout[column].length, position: 'before' })
  }

  const performDrop = () => {
    if (!drag || !over) return endDrag()

    const { source, id, index: srcIdx } = drag
    const { column: dstCol, index: dstIdx, position } = over
    let insertAt = position === 'before' ? dstIdx : dstIdx + 1

    const next = { large: [...layout.large], medium: [...layout.medium] }
    const entryFor = (wid) => {
      const def = WIDGET_REGISTRY[wid]
      if (dstCol === 'large') {
        return { id: wid, size: def?.defaultSize || 'full' }
      }
      return { id: wid }
    }

    if (source === 'library') {
      next[dstCol].splice(insertAt, 0, entryFor(id))
    } else {
      if (source === dstCol) {
        const [moved] = next[source].splice(srcIdx, 1)
        if (srcIdx < insertAt) insertAt -= 1
        const normalized = dstCol === 'large' && !moved.size ? { ...moved, size: 'full' } : moved
        next[dstCol].splice(insertAt, 0, normalized)
      } else {
        const [moved] = next[source].splice(srcIdx, 1)
        next[dstCol].splice(insertAt, 0, entryFor(moved.id))
      }
    }

    /* Heal orphaned half-widgets — a half can only sit beside another
       half. If it ends up alone, promote it to full so the layout
       doesn't have an awkward 50%-wide gap. */
    const healed = []
    for (let i = 0; i < next.large.length; i++) {
      const cur = next.large[i]
      const nxt = next.large[i + 1]
      if (cur.size === 'half' && (!nxt || nxt.size !== 'half')) {
        healed.push({ ...cur, size: 'full' })
      } else {
        healed.push(cur)
      }
    }
    next.large = healed

    onLayoutChange(next)
    endDrag()
  }

  const removeFromColumn = (column, index) => () => {
    const next = { large: [...layout.large], medium: [...layout.medium] }
    next[column].splice(index, 1)
    onLayoutChange(next)
  }

  const renderEditableWidget = (column, item, index, sizeClass) => {
    const dragging = drag?.source === column && drag?.index === index
    const dropBefore = over?.column === column && over?.index === index && over?.position === 'before'
    const dropAfter = over?.column === column && over?.index === index && over?.position === 'after'

    /* sizeClass is applied via wrapper div so we don't need to add new
       size variants to WidgetCard. The wrapper handles flex behavior;
       the card fills it. */
    return (
      <div className={sizeClass} key={`${item.id}-${index}`}>
        {renderRegistryWidget(item.id, {
          monitoring,
          editMode: true,
          onEdit: () => onEditWidget?.(item.id),
          onRemove: removeFromColumn(column, index),
          draggable: true,
          onDragStart: startDrag(column, item.id, index),
          onDragOver: onCardDragOver(column, index),
          onDrop: performDrop,
          onDragEnd: endDrag,
          isDragging: dragging,
          dropBefore,
          dropAfter,
        })}
      </div>
    )
  }

  /* Render the large column, pairing adjacent halves into a
     side-by-side row. */
  const renderLargeColumn = () => {
    const out = []
    let i = 0
    while (i < layout.large.length) {
      const cur = layout.large[i]
      const nxt = layout.large[i + 1]
      if (cur.size === 'half' && nxt && nxt.size === 'half') {
        const iA = i
        const iB = i + 1
        out.push(
          <div className="widget-pair" key={`pair-${cur.id}-${nxt.id}-${iA}`}>
            {renderEditableWidget('large', cur, iA, 'customize-half')}
            {renderEditableWidget('large', nxt, iB, 'customize-half')}
          </div>
        )
        i += 2
      } else {
        out.push(renderEditableWidget('large', cur, i, 'customize-full'))
        i += 1
      }
    }
    return out
  }

  return (
    <div className="customize-body">
      <div className="customize-canvas">
        <div className="dashboard-content">
          <div
            className="dashboard-col-large"
            onDragOver={onColumnDragOver('large')}
            onDrop={performDrop}
          >
            {renderLargeColumn()}
          </div>
          <div
            className="dashboard-col-medium"
            onDragOver={onColumnDragOver('medium')}
            onDrop={performDrop}
          >
            {layout.medium.map((w, i) => renderEditableWidget('medium', w, i, 'customize-medium'))}
          </div>
        </div>
      </div>

      <aside className="customize-library">
        <div className="customize-library-header">
          <div className="customize-library-title">Widget library</div>
          <div className="customize-library-hint">Drag onto the dashboard to add</div>
        </div>
        <div className="customize-library-list">
          {(() => {
            const placed = new Set([
              ...layout.large.map((w) => w.id),
              ...layout.medium.map((w) => w.id),
            ])
            const available = Object.entries(WIDGET_REGISTRY).filter(([id]) => !placed.has(id))
            if (available.length === 0) {
              return <div className="customize-library-empty">All widgets placed on the dashboard.</div>
            }
            return available.map(([id, spec]) => (
              <div
                key={id}
                className="library-item"
                draggable
                onDragStart={startDrag('library', id, null)}
                onDragEnd={endDrag}
              >
                <div className="library-item-icon"><GripIcon /></div>
                <div className="library-item-body">
                  <div className="library-item-title">{spec.title}</div>
                  <div className="library-item-type">{spec.type}</div>
                  {spec.description && <div className="library-item-desc">{spec.description}</div>}
                </div>
              </div>
            ))
          })()}
        </div>
      </aside>
    </div>
  )
}

export default function Customize({ onClose, config, onScopeChange, onMonitoringChange, onLayoutChange }) {
  const [isEditScopeOpen, setEditScopeOpen] = useState(false)
  const [editingWidgetId, setEditingWidgetId] = useState(null)

  /* Local layout state — drag/remove changes update this, but they
     don't reach the saved config until the user clicks Save changes.
     Cancel walks away with the current saved layout intact. The lazy
     initializer reads the active dashboard's layout if it has one,
     otherwise the registry default. */
  const [layout, setLayout] = useState(() => config?.layout || DEFAULT_LAYOUT)

  const handleApplyScope = (newScope) => {
    if (onScopeChange) onScopeChange(newScope)
    setEditScopeOpen(false)
  }

  const handleSaveMonitoring = (widgetId, rules) => {
    if (onMonitoringChange) onMonitoringChange(widgetId, rules)
    setEditingWidgetId(null)
  }

  /* Commit pending layout changes (if any) and exit. Scope and
     monitoring already persist immediately when their modals close,
     so this only needs to flush layout. */
  const handleSaveChanges = () => {
    if (onLayoutChange) onLayoutChange(layout)
    onClose()
  }

  return (
    <div className="customize-frame">
      <div className="customize-header">
        <div>
          <h1 className="customize-heading">Edit dashboard</h1>
          <p className="customize-subheading">
            Rearrange, add, and customize widgets. Changes are not saved until you click Save changes.
          </p>
        </div>
        <div className="customize-actions">
          <button type="button" className="customize-btn tertiary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="customize-btn secondary"
            onClick={() => setEditScopeOpen(true)}
          >
            Edit Scope
          </button>
          <button type="button" className="customize-btn primary" onClick={handleSaveChanges}>Save changes</button>
        </div>
      </div>

      <CustomizeBoard
        layout={layout}
        onLayoutChange={setLayout}
        onEditWidget={setEditingWidgetId}
        monitoring={config?.monitoring}
      />

      <EditScopeModal
        isOpen={isEditScopeOpen}
        currentScope={config?.scope}
        mode={config?.mode}
        onApply={handleApplyScope}
        onCancel={() => setEditScopeOpen(false)}
      />

      <EditWidgetModal
        widgetId={editingWidgetId}
        currentRules={
          editingWidgetId ? config?.monitoring?.[editingWidgetId] : undefined
        }
        onSave={(rules) => handleSaveMonitoring(editingWidgetId, rules)}
        onClose={() => setEditingWidgetId(null)}
        onRemove={() => {
          /* Deferred — the prototype removes via the X on the card. */
          setEditingWidgetId(null)
        }}
      />
    </div>
  )
}
