import {
  FunnelIcon,
  LayoutGridIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
} from 'lucide-react';

import {
  DASHBOARD_SERVICE_STATUS,
  DASHBOARD_SORT_OPTION,
  DASHBOARD_VIEW,
  type DashboardSortOption,
  type DashboardView,
} from '@/app/(dashboard)/_constants/dashboard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ServiceStatus } from '@/types';

import { RefreshCountdownButton } from './refresh-countdown-button';

interface DashboardToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;

  view: DashboardView;
  sortOption: DashboardSortOption;
  statusFilters: ServiceStatus[];
  onSortOptionChange: (sort: DashboardSortOption) => void;
  onStatusToggle: (status: ServiceStatus) => void;
  onViewChange: (values: string[]) => void;
  onAddService: () => void;
}

export function DashboardToolbar({
  search,
  onSearchChange,

  view,
  sortOption,
  statusFilters,
  onSortOptionChange,
  onStatusToggle,
  onViewChange,
  onAddService,
}: DashboardToolbarProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <InputGroup className="h-9 max-w-xs flex-1">
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search services..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
          className="h-9"
        />
      </InputGroup>

      <div className="ml-auto flex items-center gap-2">
        <RefreshCountdownButton />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer max-lg:px-2.5"
                aria-label={view === DASHBOARD_VIEW.CARD ? 'Filter and sort' : 'Filter'}
              />
            }
          >
            <FunnelIcon />
            <span className="hidden lg:inline">
              {view === DASHBOARD_VIEW.CARD ? 'Filter & Sort' : 'Filter'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {view === DASHBOARD_VIEW.CARD && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort cards</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortOption}
                    onValueChange={(value) =>
                      onSortOptionChange(value as DashboardSortOption)
                    }
                  >
                    <DropdownMenuRadioItem
                      value={DASHBOARD_SORT_OPTION.NAME_ASC}
                      className="cursor-pointer"
                    >
                      Name (A-Z)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value={DASHBOARD_SORT_OPTION.NAME_DESC}
                      className="cursor-pointer"
                    >
                      Name (Z-A)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value={DASHBOARD_SORT_OPTION.HEALTH_DESC}
                      className="cursor-pointer"
                    >
                      Health score (high-low)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value={DASHBOARD_SORT_OPTION.LATENCY_ASC}
                      className="cursor-pointer"
                    >
                      Latency (low-high)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Status filters</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(DASHBOARD_SERVICE_STATUS.UP)}
                onCheckedChange={() =>
                  onStatusToggle(DASHBOARD_SERVICE_STATUS.UP)
                }
                className="cursor-pointer"
              >
                Up
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(DASHBOARD_SERVICE_STATUS.SLOW)}
                onCheckedChange={() =>
                  onStatusToggle(DASHBOARD_SERVICE_STATUS.SLOW)
                }
                className="cursor-pointer"
              >
                Slow
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(DASHBOARD_SERVICE_STATUS.DOWN)}
                onCheckedChange={() =>
                  onStatusToggle(DASHBOARD_SERVICE_STATUS.DOWN)
                }
                className="cursor-pointer"
              >
                Down
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup
          variant="outline"
          size="lg"
          value={[view]}
          onValueChange={onViewChange}
          className="hidden sm:flex"
        >
          <ToggleGroupItem
            value={DASHBOARD_VIEW.TABLE}
            aria-label="Table view"
            className="cursor-pointer"
          >
            <TableIcon data-icon />
          </ToggleGroupItem>
          <ToggleGroupItem
            value={DASHBOARD_VIEW.CARD}
            aria-label="Card view"
            className="cursor-pointer"
          >
            <LayoutGridIcon data-icon />
          </ToggleGroupItem>
        </ToggleGroup>

        <Button size="lg" className="cursor-pointer" onClick={onAddService}>
          <PlusIcon />
          Add New Service
        </Button>
      </div>
    </div>
  );
}
