import UpdateVehicle from "../components/updatevehicle";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <>
      <div className="pb-0">
      <UpdateVehicle/>
      </div>
      
      </>
       
    );
  }
