import {
  FunnelIcon,
  LayoutGridIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  DASHBOARD_SERVICE_STATUS,
  DASHBOARD_SORT_OPTION,
  DASHBOARD_VIEW,
  type DashboardSortOption,
} from '@/app/(dashboard)/_constants/dashboard';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
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
import { useDebounce } from '@/hooks/use-debounce';

import { useDashboardStateContext } from './dashboard-state-provider';
import { RefreshCountdownButton } from './refresh-countdown-button';
import { addServiceDialogHandle } from './service-dialog-handles';

export function DashboardToolbar() {
  const {
    dashboardView,
    handleSearchChange,
    handleSortOptionChange,
    handleStatusToggle,
    handleViewChange,
    search,
    sortOption,
    statusFilters,
  } = useDashboardStateContext();
  const [inputSearch, setInputSearch] = useState(search);
  const debouncedSearch = useDebounce(inputSearch, 300);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  return (
    <div className="mb-4 flex items-center gap-3">
      <InputGroup className="h-9 max-w-xs flex-1">
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search services..."
          value={inputSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputSearch(e.target.value)
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
                aria-label={
                  dashboardView === DASHBOARD_VIEW.CARD
                    ? 'Filter and sort'
                    : 'Filter'
                }
              />
            }
          >
            <FunnelIcon />
            <span className="hidden lg:inline">
              {dashboardView === DASHBOARD_VIEW.CARD
                ? 'Filter & Sort'
                : 'Filter'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {dashboardView === DASHBOARD_VIEW.CARD && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort cards</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortOption}
                    onValueChange={(value) =>
                      handleSortOptionChange(value as DashboardSortOption)
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
                  handleStatusToggle(DASHBOARD_SERVICE_STATUS.UP)
                }
                className="cursor-pointer"
              >
                Up
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(DASHBOARD_SERVICE_STATUS.SLOW)}
                onCheckedChange={() =>
                  handleStatusToggle(DASHBOARD_SERVICE_STATUS.SLOW)
                }
                className="cursor-pointer"
              >
                Slow
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(DASHBOARD_SERVICE_STATUS.DOWN)}
                onCheckedChange={() =>
                  handleStatusToggle(DASHBOARD_SERVICE_STATUS.DOWN)
                }
                className="cursor-pointer"
              >
                Down
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(
                  DASHBOARD_SERVICE_STATUS.RATE_LIMITED,
                )}
                onCheckedChange={() =>
                  handleStatusToggle(DASHBOARD_SERVICE_STATUS.RATE_LIMITED)
                }
                className="cursor-pointer"
              >
                Rate limited
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes(
                  DASHBOARD_SERVICE_STATUS.PENDING,
                )}
                onCheckedChange={() =>
                  handleStatusToggle(DASHBOARD_SERVICE_STATUS.PENDING)
                }
                className="cursor-pointer"
              >
                Pending
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup
          variant="outline"
          size="lg"
          value={[dashboardView]}
          onValueChange={handleViewChange}
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

        <DialogTrigger
          handle={addServiceDialogHandle}
          render={<Button size="lg" className="cursor-pointer" />}
        >
          <PlusIcon />
          Add New Service
        </DialogTrigger>
      </div>
    </div>
  );
}
