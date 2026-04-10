import { FC, useState } from 'react';
import { Grid } from '@material-ui/core';
import ClientDetails from './components/ClientDetails';
import ClientLocation from './components/ClientLocation';
import ClientContact from './components/ClientContact';
import DetailsForm from './components/EditForm/DetailsForm';
import LocationForm from './components/EditForm/LocationForm';
import ContactForm from './components/EditForm/ContactForm';
import SideBarContent from 'components/SideBarContent';
import { ucWords } from 'utils';

interface Props {
  isLoading: boolean;
  clients: ClientDetailsModel;
  setClients: React.Dispatch<React.SetStateAction<ClientDetailsModel>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const ProfileContent: FC<Props> = props => {
  const { isLoading, clients, setClients, handleSnackbar } = props;

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editType, setEditType] = useState<string>('');

  const handleClose = () => {
    setOpenForm(false);
  };

  return (
    <Grid container spacing={3}>
      <ClientDetails clients={clients} isLoading={isLoading} setOpenForm={setOpenForm} setEditType={setEditType} />
      <ClientLocation clients={clients} isLoading={isLoading} setOpenForm={setOpenForm} setEditType={setEditType} />
      <ClientContact clients={clients} isLoading={isLoading} setOpenForm={setOpenForm} setEditType={setEditType} />
      <SideBarContent
        title={ucWords(`Edit ${editType}`)}
        open={openForm}
        onClickDrawer={() => setOpenForm(false)}
        width={editType.includes('location') ? '60%' : '50%'}
      >
        {editType.includes('details') ? (
          <DetailsForm clients={clients} setClients={setClients} handleSnackbar={handleSnackbar} setOpenForm={setOpenForm} />
        ) : editType.includes('location') ? (
          <LocationForm clients={clients} setClients={setClients} handleSnackbar={handleSnackbar} openForm={openForm} handleClose={handleClose} />
        ) : (
          <ContactForm clients={clients} setClients={setClients} handleSnackbar={handleSnackbar} setOpenForm={setOpenForm} />
        )}
      </SideBarContent>
    </Grid>
  );
};

export default ProfileContent;
