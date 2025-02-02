import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { IconNotes } from '@/ui/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { Avatar } from '@/users/components/Avatar';
import {
  QueryMode,
  useSearchActivityQuery,
  useSearchCompanyQuery,
  useSearchPeopleQuery,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { useCommandMenu } from '../hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

import { CommandMenuItem } from './CommandMenuItem';
import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledList,
} from './CommandMenuStyles';

export function CommandMenu() {
  const { openCommandMenu, closeCommandMenu } = useCommandMenu();
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      openCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [openCommandMenu],
  );

  const { data: peopleData } = useSearchPeopleQuery({
    variables: {
      where: {
        OR: [
          { firstName: { contains: search, mode: QueryMode.Insensitive } },
          { lastName: { contains: search, mode: QueryMode.Insensitive } },
        ],
      },
      limit: 3,
    },
  });
  const people = peopleData?.searchResults ?? [];

  const { data: companyData } = useSearchCompanyQuery({
    variables: {
      where: {
        OR: [{ name: { contains: search, mode: QueryMode.Insensitive } }],
      },
      limit: 3,
    },
  });
  const companies = companyData?.searchResults ?? [];

  const { data: activityData } = useSearchActivityQuery({
    variables: {
      where: {
        OR: [
          { title: { contains: search, mode: QueryMode.Insensitive } },
          { body: { contains: search, mode: QueryMode.Insensitive } },
        ],
      },
      limit: 3,
    },
  });
  const activities = activityData?.searchResults ?? [];

  const commands = [
    {
      to: '/people',
      label: 'Go to People',
      shortcuts: ['G', 'P'],
    },
    {
      to: '/companies',
      label: 'Go to Companies',
      shortcuts: ['G', 'C'],
    },
    {
      to: '/opportunities',
      label: 'Go to Opportunities',
      shortcuts: ['G', 'O'],
    },
    {
      to: '/settings/profile',
      label: 'Go to Settings',
      shortcuts: ['G', 'S'],
    },
    {
      to: '/tasks',
      label: 'Go to Tasks',
      shortcuts: ['G', 'T'],
    },
  ];

  const matchingCommand = commands.find(
    (cmd) => cmd.shortcuts.join('') === search?.toUpperCase(),
  );

  /*
  TODO: Allow performing actions on page through CommandBar 

  import { useMatch, useResolvedPath } from 'react-router-dom';
  import { IconBuildingSkyscraper, IconUser } from '@/ui/icon';

  const createSection = (
    <StyledGroup heading="Create">
      <CommandMenuItem
        label="Create People"
        onClick={createPeople}
        icon={<IconUser />}
        shortcuts={
          !!useMatch({
            path: useResolvedPath('/people').pathname,
            end: true,
          })
            ? ['C']
            : []
        }
      />
      <CommandMenuItem
        label="Create Company"
        onClick={createCompany}
        icon={<IconBuildingSkyscraper />}
        shortcuts={
          !!useMatch({
            path: useResolvedPath('/companies').pathname,
            end: true,
          })
            ? ['C']
            : []
        }
      />
    </StyledGroup>
  );*/

  return (
    <StyledDialog
      open={isCommandMenuOpened}
      onOpenChange={(opened) => {
        if (!opened) {
          closeCommandMenu();
        }
      }}
      label="Global Command Menu"
      shouldFilter={false}
    >
      <StyledInput
        placeholder="Search"
        value={search}
        onValueChange={setSearch}
      />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>
        {matchingCommand && (
          <StyledGroup heading="Navigate">
            <CommandMenuItem
              to={matchingCommand.to}
              label={matchingCommand.label}
              shortcuts={matchingCommand.shortcuts}
            />
          </StyledGroup>
        )}
        {!!people.length && (
          <StyledGroup heading="People">
            {people.map((person) => (
              <CommandMenuItem
                to={`person/${person.id}`}
                label={person.displayName}
                key={person.id}
                icon={
                  <Avatar
                    avatarUrl={null}
                    size="sm"
                    colorId={person.id}
                    placeholder={person.displayName}
                  />
                }
              />
            ))}
          </StyledGroup>
        )}
        {!!companies.length && (
          <StyledGroup heading="Companies">
            {companies.map((company) => (
              <CommandMenuItem
                to={`companies/${company.id}`}
                label={company.name}
                key={company.id}
                icon={
                  <Avatar
                    avatarUrl={getLogoUrlFromDomainName(company.domainName)}
                    size="sm"
                    colorId={company.id}
                    placeholder={company.name}
                  />
                }
              />
            ))}
          </StyledGroup>
        )}
        {!!activities.length && (
          <StyledGroup heading="Notes">
            {activities.map((activity) => (
              <CommandMenuItem
                onClick={() => openActivityRightDrawer(activity.id)}
                label={activity.title ?? ''}
                key={activity.id}
                icon={<IconNotes />}
              />
            ))}
          </StyledGroup>
        )}
        {!matchingCommand && (
          <StyledGroup heading="Navigate">
            {commands
              .filter(
                (cmd) =>
                  cmd.shortcuts?.join('').includes(search?.toUpperCase()) ||
                  cmd.label?.toUpperCase().includes(search?.toUpperCase()),
              )
              .map((cmd) => (
                <CommandMenuItem
                  key={cmd.shortcuts.join('')}
                  to={cmd.to}
                  label={cmd.label}
                  shortcuts={cmd.shortcuts}
                />
              ))}
          </StyledGroup>
        )}
      </StyledList>
    </StyledDialog>
  );
}
