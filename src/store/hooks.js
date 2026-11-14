import { useDispatch, useSelector } from 'react-redux';

// En TS esto tipaba el dispatch/selector contra RootState/AppDispatch; en JS
// no hay tipos que propagar, así que son alias directos de los hooks de
// react-redux — se mantienen para no importar useDispatch/useSelector sueltos
// en los componentes.
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
