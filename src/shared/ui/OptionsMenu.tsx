import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { DotsHorizontalIcon } from '@/shared/icons/Icons'

interface OptionsMenuItem {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface OptionsMenuProps {
  items: OptionsMenuItem[]
  ariaLabel: string
  className?: string
}

export function OptionsMenu({ items, ariaLabel, className = '' }: OptionsMenuProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0 cursor-pointer ${className}`}
          aria-label={ariaLabel}
        >
          <DotsHorizontalIcon className="w-5 h-5 text-gray-600" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
          align="end"
        >
          {items.map((item, index) => (
            <div key={index}>
              {index > 0 && <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />}
              <DropdownMenu.Item
                className={`px-3 py-2 text-sm rounded-md cursor-pointer focus:outline-none ${
                  item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
                }`}
                onSelect={item.onClick}
              >
                {item.label}
              </DropdownMenu.Item>
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}





