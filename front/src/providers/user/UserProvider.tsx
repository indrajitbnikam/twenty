import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useFetchCurrentUser } from '@/auth/hooks/useFetchCurrentUser';
import { currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';

export function UserProvider({ children }: React.PropsWithChildren) {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [tokenPair] = useRecoilState(tokenPairState);
  const user = useFetchCurrentUser(tokenPair);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [setCurrentUser, user]);

  return <>{children}</>;
}
